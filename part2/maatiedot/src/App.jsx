import React, { useEffect, useState } from 'react'
import axios from 'axios'

const countriesUrl = 'https://studies.cs.helsinki.fi/restcountries/api/all'
const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather'
const weatherApiKey = import.meta.env.VITE_SOME_KEY

const CountryDetail = ({ country }) => {
  const [weather, setWeather] = useState(null)
  const [weatherError, setWeatherError] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const capital = country.capital?.[0]
  const languages = Object.values(country.languages ?? {})

  useEffect(() => {
    setWeather(null)
    setWeatherError(null)

    if (!capital) {
      return
    }

    if (!weatherApiKey) {
      setWeatherError('Set VITE_SOME_KEY in .env to load capital weather.')
      return
    }

    let cancelled = false
    setWeatherLoading(true)

    axios
      .get(weatherUrl, {
        params: {
          q: capital,
          units: 'metric',
          appid: weatherApiKey
        }
      })
      .then(response => {
        if (!cancelled) {
          setWeather(response.data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWeatherError(`Could not load weather for ${capital}.`)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setWeatherLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [capital, country.cca3])

  return (
    <section>
      <h2>{country.name.common}</h2>
      <p>capital {country.capital?.join(', ') ?? 'N/A'}</p>
      <p>area {country.area}</p>
      <h3>languages:</h3>
      <ul>
        {languages.map(language => (
          <li key={language}>{language}</li>
        ))}
      </ul>
      <img
        src={country.flags.png}
        alt={`Flag of ${country.name.common}`}
        width="150"
      />
      {capital && (
        <div>
          <h3>Weather in {capital}</h3>
          {weatherLoading && <p>Loading weather...</p>}
          {weatherError && <p role="alert">{weatherError}</p>}
          {weather && (
            <>
              <p>temperature {weather.main.temp} Celsius</p>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
              />
              <p>wind {weather.wind.speed} m/s</p>
            </>
          )}
        </div>
      )}
    </section>
  )
}

const App = () => {
  const [query, setQuery] = useState('')
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios
      .get(countriesUrl)
      .then(response => {
        setCountries(response.data)
      })
      .catch(() => {
        setError('Could not load countries. Please try again later.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const normalizedQuery = query.trim().toLowerCase()
  const matches = normalizedQuery === ''
    ? []
    : countries.filter(country =>
        country.name.common.toLowerCase().includes(normalizedQuery)
      )
  const countryToShow = selectedCountry ?? (matches.length === 1 ? matches[0] : null)

  const handleQueryChange = event => {
    setQuery(event.target.value)
    setSelectedCountry(null)
  }

  return (
    <main style={{ padding: 20 }}>
      <label>
        find countries <input value={query} onChange={handleQueryChange} />
      </label>

      <div style={{ marginTop: 20 }}>
        {loading && <p>Loading countries...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && matches.length > 10 && (
          <p>Too many matches, specify another filter</p>
        )}
        {!loading && !error && !countryToShow && matches.length > 1 && matches.length <= 10 && (
          <ul>
            {matches.map(country => (
              <li key={country.cca3} style={{ marginBottom: 5 }}>
                {country.name.common}{' '}
                <button onClick={() => setSelectedCountry(country)}>show</button>
              </li>
            ))}
          </ul>
        )}
        {!loading && !error && countryToShow && (
          <CountryDetail country={countryToShow} />
        )}
      </div>
    </main>
  )
}

export default App
