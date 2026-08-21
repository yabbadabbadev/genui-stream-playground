import './WeatherCard.css'

const CONDITION_ICONS: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
}

type WeatherCardProps = {
  data: Record<string, unknown>
}

const WeatherCard = ({ data }: WeatherCardProps) => {
  const city = typeof data.city === 'string' ? data.city : 'Ciudad desconocida'
  const temp = typeof data.temp === 'number' ? data.temp : null
  const condition = typeof data.condition === 'string' ? data.condition : null
  const icon = condition ? (CONDITION_ICONS[condition] ?? '🌡️') : '🌡️'

  return (
    <article className="weather-card" aria-label={`Tiempo en ${city}`}>
      <span className="weather-card__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="weather-card__summary">
        <h3 className="weather-card__city">{city}</h3>
        {condition && <p className="weather-card__condition">{condition}</p>}
      </div>
      {temp !== null && <p className="weather-card__temp">{temp}°C</p>}
    </article>
  )
}

export { WeatherCard }
