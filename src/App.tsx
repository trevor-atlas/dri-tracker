import { useCallback, useState } from 'react'
import './App.css'

function encode(data: string[]) {
  return encodeURIComponent(btoa(data.join('\n')));
}

function decode(data: string) {
  return atob(decodeURIComponent(data)).split('\n');
}

function shuffle<T>(array: T[]) {
  return array
    .map<[number, T]>(value => [Math.random(), value])
    .sort(([a], [b]) => a - b)
    .map<T>(entry => entry[1])
}

const WEEK_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;

export function getWeekNumber(date: Date) {
  // Copy the date object to avoid modifying the original
  const givenDate = new Date(date.getTime());

  // Set the time to midnight to ensure consistency
  givenDate.setHours(0, 0, 0, 0);

  // Get the first day of the year for the given date
  const yearStart = new Date(givenDate.getFullYear(), 0, 1);

  // the number of milliseconds in a week

  // Calculate the difference in milliseconds between the given date and the year start
  const diffMilliseconds = givenDate.getTime() - yearStart.getTime();

  // Calculate the week number
  return Math.ceil(diffMilliseconds / WEEK_MILLISECONDS);
}

function getWeeklyDRI(team: string[], date: Date = new Date()): string {
  const weekNumber = getWeekNumber(date);
  return team[weekNumber % team.length];
}

const initialData = window.location.search ? decode(window.location.search.slice(1)) : [];

function CurrentDRIS({candidates}: {candidates: string[]}) {
  const now = new Date();

    return (<div className="primary-info-callout rounded-md p-8 mb-8 text-2xl text-slate-800 text-opacity-90">
      {candidates.length > 1 ? (
        <>
          <small className="uppercase text-md mb-2 inline-block">Week <span className="font-bold underline">{getWeekNumber(now)}/52</span> of {now.getFullYear()}</small>
          <p>The current DRI is <strong className="capitalize">{getWeeklyDRI(candidates.filter(Boolean))}</strong></p>
          <p>The next DRI is <strong className="capitalize">{getWeeklyDRI(candidates, new Date(Date.now() + WEEK_MILLISECONDS))}</strong></p>
        </>
      ) : (
        <p>Enter at least 2 people to get started</p>
      )}
    </div>)
}

function App() {
  const [candidates, setCandidates] = useState<string[]>(initialData);
  const setCandidatesAndStore = useCallback((data: string[]) => {
    setCandidates(data);
    window.history.replaceState(null, '', '?' + encode(data));
  }, [])

  return (
    <>
    <h1 className="text-6xl text-gray-300 font-black">🫡 DRI Tracker</h1>
    <h2 className="text-4xl text-gray-400 mb-8 font-bold">Who is the DRI this week?</h2>
    <CurrentDRIS candidates={candidates.filter(Boolean)} />
    <div className="bg-zinc-600 rounded-md p-8 mb-8 text-lg text-gray-300">
      <div className="p-4 text-left">
      <h3 className="font-bold text-zinc-300 text-2xl mb-4">DRIs</h3>
      <p>Enter each person on a new line</p>
      <p>Share the link to share the list (everything is encoded in the URL)</p>
      </div>
      <div className="py-4 text-left">
    <button className="mr-2" onClick={() => setCandidatesAndStore([])}>Clear</button>
    <button onClick={() => setCandidatesAndStore(shuffle(candidates))}>Randomize order</button>
      </div>
        <textarea
        className="font-mono rounded-md p-4"
        style={{ width: '100%', height: '200px' }}
        aria-expanded={true}
        value={candidates.join('\n')}
        onChange={(e) => {
          const data = e.target.value.split('\n');
          setCandidatesAndStore(data);
        }} />
    </div>
    </>
  )
}

export default App
