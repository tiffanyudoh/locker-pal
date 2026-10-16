import { LcdBtn, LcdChrome } from '../components/LcdWidgets';
import { formatMmSs } from '../lib/util';
import { usePda, usePdaKeys } from '../nav/PdaContext';

export function Timer() {
  const {
    goHome,
    timerRemainingMs,
    timerPaused,
    timerFinished,
    timerActive,
    pauseTimer,
    resumeTimer,
    restartTimer,
    stopTimer,
    resetTimer,
  } = usePda();

  usePdaKeys((key) => {
    if (key !== 'OK') return;
    if (timerFinished) {
      restartTimer();
      return;
    }
    if (timerPaused) resumeTimer();
    else pauseTimer();
  });

  const status = timerFinished
    ? "TIME'S UP"
    : !timerActive
      ? 'READY'
      : timerPaused
        ? 'PAUSED'
        : 'FOCUS';
  const right = timerFinished ? 'DONE' : !timerActive ? 'IDLE' : timerPaused ? 'HOLD' : 'RUN';

  return (
    <LcdChrome title="TIMER" right={right}>
      <div className="timer-wrap">
        <div>{status}</div>
        <div className="timer-display" aria-live="polite">
          {formatMmSs(timerRemainingMs)}
        </div>
        <div className="lcd-btn-row">
          {timerFinished ? (
            <LcdBtn onClick={restartTimer}>RESTART</LcdBtn>
          ) : (
            <>
              {timerPaused ? (
                <LcdBtn onClick={resumeTimer}>GO</LcdBtn>
              ) : (
                <LcdBtn onClick={pauseTimer}>PAUSE</LcdBtn>
              )}
              {timerActive ? <LcdBtn onClick={stopTimer}>STOP</LcdBtn> : null}
              <LcdBtn onClick={resetTimer}>RESET</LcdBtn>
            </>
          )}
          <LcdBtn onClick={goHome}>EXIT</LcdBtn>
        </div>
      </div>
    </LcdChrome>
  );
}
