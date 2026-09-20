// Fifth screen ("Skills"), measured from suv4.png (a 506px-wide mock-up).
// The mock-up shows a single card centred under a large outlined SKILLS
// wordmark; SKILLS is driven by the array below, so more cards flow into the
// same centred row.
const SKILLS = [
  {
    title: ['Algorithmic', 'Problem solving'],
    blurb:
      'Applying structured thinking and computational techniques to break down complex problems, develop efficient solutions, and optimize them for performance, scalability, and reliability.',
    tags: ['Optimization', 'Data Structures', 'Logical reasoning', 'Complexity Analysis'],
  },
]

function SkillCard({ title, blurb, tags }) {
  return (
    <article
      className="relative flex w-[clamp(17rem,24vw,21.5rem)] flex-col rounded-[16px] border border-white/[0.07] px-[1.25rem] pt-[5rem] pb-[3.6rem]"
      style={{ backgroundImage: 'linear-gradient(180deg, #131111 0%, #0c0b0b 62%)' }}
    >
      <h3 className="font-sans text-[clamp(1.4rem,2.3vw,2.05rem)] leading-[1.06] font-bold tracking-[-0.02em] text-white">
        {title.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h3>

      <p className="mt-[1.15rem] text-[0.8125rem] leading-[1.55] text-[#877b7b]">{blurb}</p>

      <hr className="mt-[2rem] border-0 border-t border-white/[0.07]" />

      <ul className="mt-[1.6rem] flex flex-wrap gap-[0.5rem]">
        {tags.map((tag) => (
          <li
            key={tag}
            className="rounded-[5px] border border-[#c47a72]/25 px-[0.7rem] py-[0.5rem] text-[0.8125rem] leading-none text-[#b89a98]"
          >
            {tag}
          </li>
        ))}
      </ul>

      <hr className="mt-[1.6rem] border-0 border-t border-white/[0.07]" />

      {/* Ring marker in the bottom corner. */}
      <span
        aria-hidden="true"
        className="absolute right-[1.25rem] bottom-[1rem] size-[1.5rem] rounded-full border-2 border-[#e07a74]/45 bg-[#c92a2a] shadow-[0_0_10px_rgba(201,42,42,0.55)]"
      />
    </article>
  )
}

function Skills() {
  return (
    <section id="skills" className="relative isolate overflow-hidden bg-[#0a0101] font-jost text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(48% 30% at 50% -6%, rgba(140,16,16,0.30), transparent 72%)',
            'radial-gradient(60% 26% at 50% 106%, rgba(120,12,12,0.26), transparent 74%)',
          ].join(','),
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,96,86,0.16) 1px, transparent 1px)',
          backgroundSize: '21px 21px',
        }}
      />

      <div className="relative mx-auto max-w-[1600px] px-[8vw] pt-[clamp(3.5rem,7vw,6rem)] pb-[clamp(4rem,9vw,8rem)]">
        <h2
          className="text-center font-sans text-[18vw] leading-[0.85] font-extrabold tracking-[0.02em] select-none"
          style={{ WebkitTextStroke: '1px rgba(228,60,54,0.16)', color: 'transparent' }}
        >
          SKILLS
        </h2>

        <div className="mt-[clamp(3rem,9vw,8rem)] flex flex-wrap justify-center gap-[clamp(1.5rem,2.5vw,2.25rem)]">
          {SKILLS.map((s) => (
            <SkillCard key={s.title.join(' ')} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
