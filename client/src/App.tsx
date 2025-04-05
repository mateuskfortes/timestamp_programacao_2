import TimeDiff from "./components/time_diff/TimeDiff.tsx"
import TimeStamp from "./components/timestamp/TimeStamp.tsx"
import "./styles/mais.scss"

function App() {
  return (
    <div className="app">
      <TimeStamp />
      <TimeDiff />
    </div>
  )
}

export default App
