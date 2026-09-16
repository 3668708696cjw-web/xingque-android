import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { EVENTS, LINEAGES, PEOPLE, STORIES, personById, yearLabel } from "@/lib/horosa/history";
import { CLASSICS } from "@/lib/horosa/classics";
import { encyclopedia, isBookmarked, toggleBookmark } from "@/lib/horosa/xuanshi";
import { ALL_TECHNIQUES } from "@/lib/horosa/catalog";
import { DYNASTIES } from "@/lib/horosa/history";

export const Route = createFileRoute("/history/$id")({ component: HistoryDetail });

function labelOf(id: string) {
  return (
    personById(id)?.name ??
    EVENTS.find((x) => x.id === id)?.title ??
    LINEAGES.find((x) => x.id === id)?.name ??
    STORIES.find((x) => x.id === id)?.title ??
    CLASSICS.find((x) => x.id === id)?.title ??
    encyclopedia().find((x) => x.id === id)?.name ??
    id
  );
}

function Star({ kind, id, title }: { kind: string; id: string; title: string }) {
  const [on, setOn] = useState(() => (typeof document === "undefined" ? false : isBookmarked(kind, id)));
  return (
    <button
      type="button"
      className="text-sm text-muted"
      onClick={() => {
        toggleBookmark({ kind, id, title });
        setOn(isBookmarked(kind, id));
      }}
    >
      {on ? "已藏" : "收藏"}
    </button>
  );
}

function Related({ ids }: { ids: string[] }) {
  const clean = ids.filter(Boolean);
  if (!clean.length) return null;
  return (
    <div className="mt-14">
      <p className="xs-eye">相关</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {clean.map((lid) => (
          <Link key={lid} to="/history/$id" params={{ id: lid }} className="xs-card xs-card-tight">
            {labelOf(lid)}
          </Link>
        ))}
      </div>
    </div>
  );
}

function TechLink({ tags, name }: { tags?: string[]; name?: string }) {
  const tech = ALL_TECHNIQUES.find((t) => t.name === name || tags?.some((tag) => t.name.includes(tag) || tag.includes(t.name)));
  if (!tech) return null;
  return (
    <Link to={tech.path as never} className="xs-btn mt-10 inline-flex">
      打开「{tech.name}」排盘
    </Link>
  );
}

function Shell({
  kicker,
  title,
  star,
  children,
}: {
  kicker: string;
  title: string;
  star: { kind: string; id: string };
  children: ReactNode;
}) {
  return (
    <article className="xs-app xs-read">
      <div className="xs-inner max-w-2xl">
        <Link to="/history" className="text-[12px] text-muted">
          玄学史
        </Link>
        <div className="mt-8 flex items-start justify-between gap-4">
          <div>
            <p className="xs-eye">{kicker}</p>
            <h1 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">{title}</h1>
          </div>
          <Star kind={star.kind} id={star.id} title={title} />
        </div>
        <div className="xs-prose mt-8">{children}</div>
      </div>
    </article>
  );
}

function HistoryDetail() {
  const { id } = Route.useParams();
  const terms = useMemo(() => encyclopedia(), []);
  const person = PEOPLE.find((p) => p.id === id);
  const event = EVENTS.find((e) => e.id === id);
  const lineage = LINEAGES.find((l) => l.id === id);
  const story = STORIES.find((s) => s.id === id);
  const classic = CLASSICS.find((c) => c.id === id);
  const term = terms.find((t) => t.id === id);

  if (person) {
    return (
      <Shell kicker={`${person.years} · ${person.tags.join(" / ")}`} title={person.name} star={{ kind: "figure", id }}>
        <span className="xs-seal mb-6">{person.name.slice(0, 1)}</span>
        <p>{person.body}</p>
        <Related ids={person.links} />
        <TechLink tags={person.tags} />
      </Shell>
    );
  }

  if (event) {
    const related =
      event.links ??
      PEOPLE.filter((p) => event.tags.some((t) => p.tags.includes(t)))
        .slice(0, 4)
        .map((p) => p.id);
    const dyn = DYNASTIES.find((d) => d.id === event.dynasty)?.name ?? "";
    return (
      <Shell kicker={`${yearLabel(event.year)} · ${dyn}`} title={event.title} star={{ kind: "event", id }}>
        <p>{event.body}</p>
        <Related ids={related} />
        <TechLink tags={event.tags} />
      </Shell>
    );
  }

  if (lineage) {
    return (
      <Shell kicker="术数源流" title={lineage.name} star={{ kind: "technique", id }}>
        <ol className="space-y-2">
          {lineage.chain.map((c, i) => (
            <li key={c}>
              {i + 1}. {c}
            </li>
          ))}
        </ol>
        <p className="mt-8">{lineage.body}</p>
        <TechLink name={lineage.technique} />
      </Shell>
    );
  }

  if (story) {
    return (
      <Shell kicker={story.source} title={story.title} star={{ kind: "story", id }}>
        <p>{story.body}</p>
        {story.person ? (
          <Related ids={[story.person]} />
        ) : null}
      </Shell>
    );
  }

  if (classic) {
    return (
      <Shell kicker={`${classic.author} · ${classic.years}`} title={classic.title} star={{ kind: "corpus", id }}>
        <p className="text-muted">{classic.summary}</p>
        {classic.body.split("\n").map((para, i) =>
          para.trim() ? (
            <p key={i} className="whitespace-pre-wrap">
              {para.trim()}
            </p>
          ) : null,
        )}
        <TechLink tags={classic.tags} />
      </Shell>
    );
  }

  if (term) {
    return (
      <Shell kicker={term.sub ?? term.cat} title={term.name} star={{ kind: term.cat, id }}>
        <p className="text-muted">{term.one}</p>
        {term.body.split("\n").map((para, i) =>
          para.trim() ? <p key={i}>{para.trim()}</p> : null,
        )}
      </Shell>
    );
  }

  return (
    <article className="xs-read">
      <div className="xs-inner max-w-2xl">
        <h1 className="font-display text-2xl">未找到</h1>
        <p className="mt-4 text-muted">馆里没有这条。</p>
        <Link to="/history" className="xs-link mt-8 inline-block">
          回总览
        </Link>
      </div>
    </article>
  );
}
