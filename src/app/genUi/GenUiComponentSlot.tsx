import type { ComponentType } from 'react'
import { WeatherCard } from 'app/genUi/WeatherCard'
import './GenUiComponentSlot.css'

type GenUiComponentProps = {
  data: Record<string, unknown>
}

const GEN_UI_COMPONENTS: Record<string, ComponentType<GenUiComponentProps>> = {
  WeatherCard,
}

type GenUiComponentSlotProps = {
  component: string
  data: Record<string, unknown>
}

const GenUiComponentSlot = ({ component, data }: GenUiComponentSlotProps) => {
  const UiComponent = GEN_UI_COMPONENTS[component]
  if (!UiComponent) {
    return (
      <p className="gen-ui-slot gen-ui-slot--unknown">
        Componente desconocido: {component}
      </p>
    )
  }
  return <UiComponent data={data} />
}

export { GenUiComponentSlot }
