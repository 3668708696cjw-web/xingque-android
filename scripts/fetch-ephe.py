#!/usr/bin/env python3
"""Resume Swiss Ephemeris asteroid download until the tree is ~1.85 GB."""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path("/workspace/data/ephe")
PUB = Path("/workspace/public")
BASE = "https://ephe.scryr.io/ephe"
UA = "Xingque-offline/4.0 (Swiss ephemeris mirror)"
TARGET = 1_850_000_000
MAX_BYTES = 1_920_000_000
WORKERS = 20
MIN_SIZE = 12_000
STATUS = Path("/tmp/fetch-ephe.status")
LOG = Path("/tmp/fetch-ephe.log")


def log(msg: str) -> None:
    line = f"{time.strftime('%H:%M:%S')} {msg}"
    print(line, flush=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def tree_size() -> int:
    total = 0
    for dirpath, _, files in os.walk(ROOT):
        for name in files:
            try:
                total += (Path(dirpath) / name).stat().st_size
            except OSError:
                pass
    return total


def ok(path: Path, min_size: int = MIN_SIZE) -> bool:
    try:
        return path.is_file() and path.stat().st_size >= min_size
    except OSError:
        return False


def fetch_one(url: str, dest: Path) -> str:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if ok(dest):
        return "skip"
    tmp = dest.with_suffix(dest.suffix + ".part")
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = resp.read()
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return "404"
        return f"http{e.code}"
    except Exception as e:
        return f"err:{type(e).__name__}"
    if len(data) < MIN_SIZE:
        return "small"
    try:
        tmp.write_bytes(data)
        tmp.replace(dest)
    except OSError as e:
        return f"write:{e}"
    return "ok"


def jobs() -> list[tuple[str, Path]]:
    out: list[tuple[str, Path]] = []
    # ast0 1-999, ast1 1000-1999, ast2 2000-2999
    for n in range(1, 3000):
        folder = f"ast{n // 1000}"
        name = f"se{n:05d}.se1"
        dest = ROOT / folder / name
        if not ok(dest):
            out.append((f"{BASE}/{folder}/{name}", dest))
    return out


def write_names() -> None:
    names: dict[str, str] = {}
    seas = ROOT / "seasnam.txt"
    if seas.is_file():
        with seas.open("r", encoding="utf-8", errors="replace") as f:
            for i, line in enumerate(f):
                if i > 4000:
                    break
                parts = line.strip().split(None, 1)
                if len(parts) == 2 and parts[0].isdigit():
                    names[str(int(parts[0]))] = parts[1]
    packed: list[int] = []
    for n in range(1, 3000):
        folder = f"ast{n // 1000}"
        p = ROOT / folder / f"se{n:05d}.se1"
        if ok(p):
            packed.append(n)
    payload = {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "count": len(packed),
        "bytes": tree_size(),
        "packed": packed,
        "names": names,
    }
    PUB.mkdir(parents=True, exist_ok=True)
    (PUB / "asteroids.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    (ROOT / "asteroids.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")


def write_status(**kw: object) -> None:
    STATUS.write_text(json.dumps({"bytes": tree_size(), **kw}, indent=2), encoding="utf-8")


def main() -> int:
    ROOT.mkdir(parents=True, exist_ok=True)
    todo = jobs()
    log(f"start size={tree_size()} jobs={len(todo)} target={TARGET}")
    write_status(phase="run", jobs=len(todo), ok=0, skip=0, miss=0)
    write_names()
    if tree_size() >= TARGET and not todo:
        log("already complete")
        write_status(phase="done", jobs=0)
        return 0

    stats = {"ok": 0, "skip": 0, "miss": 0, "fail": 0}
    stop = False
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futs = {pool.submit(fetch_one, url, dest): (url, dest) for url, dest in todo}
        done = 0
        for fut in as_completed(futs):
            url, dest = futs[fut]
            done += 1
            try:
                st = fut.result()
            except Exception as e:
                st = f"err:{e}"
            if st == "ok":
                stats["ok"] += 1
            elif st == "skip":
                stats["skip"] += 1
            elif st == "404":
                stats["miss"] += 1
            else:
                stats["fail"] += 1
            size = tree_size()
            if done % 25 == 0 or (st == "ok" and stats["ok"] % 40 == 0):
                log(f"{done}/{len(todo)} {st} {dest.name} size={size} {stats}")
                write_status(phase="run", done=done, total=len(todo), **stats)
            if size >= MAX_BYTES:
                stop = True
                break
        if stop:
            pool.shutdown(wait=False, cancel_futures=True)

    write_names()
    size = tree_size()
    log(f"done size={size} {stats}")
    write_status(phase="done", size=size, **stats)
    return 0 if size >= TARGET or stats["ok"] + stats["skip"] > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
