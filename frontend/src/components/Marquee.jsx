const ITEMS = [
  'Camping & Bivouac','Trek & Randonnée','Escalade','Kayak & Sports nautiques',
  'Photographie Nature','Astronomie','Gastronomie locale','Yoga en plein air',
  'Camping & Bivouac','Trek & Randonnée','Escalade','Kayak & Sports nautiques',
  'Photographie Nature','Astronomie','Gastronomie locale','Yoga en plein air',
]

export default function Marquee() {
  return (
    <div className="marquee-wrap">
      <div className="marquee-inner">
        {ITEMS.map((item, i) => (
          <span key={i} className="mq-item">
            <span className="mq-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
