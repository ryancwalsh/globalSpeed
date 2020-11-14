import { useState } from "react"
import { Tooltip } from "../comps/Tooltip"
import { LOCALE_MAP } from "../defaults/i18"
import { useStateView } from "../hooks/useStateView"
import { pushView } from "../background/GlobalState"
import { createFeedbackAudio } from "../utils/configUtils"
import { isFirefox } from "../utils/helper"
import { INDICATOR_INIT } from "../defaults"
import { SliderMicro } from "../comps/SliderMicro"
import { Overlay } from "../contentScript/Overlay"
import { IndicatorInit } from "../types"
import produce from "immer"
import "./SectionFlags.scss"

let feedbackAudio: HTMLAudioElement

export function SectionFlags(props: {}) {
  const [showMore, setShowMore] = useState(false)
  const [view, setView] = useStateView({indicatorInit: true, language: true, darkTheme: true, hideBadge: true, hideIndicator: true, staticOverlay: true, pinByDefault: true, ghostMode: true, hideMediaView: true, freePitch: true})
  const [volumeView, setVolumeView] = useStateView({feedbackVolume: true})
  if (!view || !volumeView) return <div></div>

  return (
    <div className="section SectionFlags">
      <h2>{window.gsm.options.flags.header}</h2>
      <div className="fields">
        <div className="field">
          <div className="labelWithTooltip">
            <span>{window.gsm.options.flags.language}</span>
            <Tooltip tooltip={window.gsm.options.flags.languageTooltip}/>
          </div>
          <select value={view.language || "detect"} onChange={e => {
            pushView({override: {language: e.target.value}})
            setTimeout(() => {
              window.location.reload()
            }, 100) 
          }}>
            {Object.keys(LOCALE_MAP).map(key => (
              <option key={key} value={key} title={LOCALE_MAP[key].title}>{LOCALE_MAP[key].display}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <span>{window.gsm.options.flags.darkTheme}</span>
          <input type="checkbox" checked={view.darkTheme || false} onChange={e => {
            pushView({override: {darkTheme: !view.darkTheme}})
          }}/>
        </div>
        <div className="field">
          <div className="labelWithTooltip">
            <span>{window.gsm.options.flags.hideIndicator}</span>
            <Tooltip tooltip={window.gsm.options.flags.hideIndicatorTooltip}/>
          </div>
          <input type="checkbox" checked={view.hideIndicator || false} onChange={e => {
            pushView({override: {hideIndicator: !view.hideIndicator}})
          }}/>
        </div>
        <div className="field">
          <div className="labelWithTooltip">
            <span>{window.gsm.options.flags.hideBadge}</span>
            <Tooltip tooltip={window.gsm.options.flags.hideBadgeTooltip}/>
          </div>
          <input type="checkbox" checked={view.hideBadge || false} onChange={e => {
            pushView({override: {hideBadge: !view.hideBadge}})
          }}/>
        </div>
        {isFirefox() ? null : (
          <div className="field">
            <span>{window.gsm.options.flags.feedbackVolume}</span>
            <input list="feedbackVolumeList" min={0} max={1} step={0.05} type="range" value={volumeView.feedbackVolume ?? 0} onChange={e => {
              feedbackAudio = feedbackAudio || createFeedbackAudio()
              feedbackAudio.volume = e.target.valueAsNumber
              feedbackAudio.currentTime = 0
              feedbackAudio.play()
              setVolumeView({
                feedbackVolume: e.target.valueAsNumber
              })
            }}/>
            <datalist id="feedbackVolumeList">
              <option value="0.5"></option>
            </datalist>
          </div>
        )}
        <div className="field">
          <div className="labelWithTooltip">
            <span>{window.gsm.options.flags.pinByDefault}</span>
            <Tooltip tooltip={window.gsm.options.flags.pinByDefaultTooltip}/>
          </div>
          <input type="checkbox" checked={view.pinByDefault || false} onChange={e => {
            pushView({override: {pinByDefault: !view.pinByDefault}})
          }}/>
        </div>
        {showMore ? <>
          <div className="field"  style={{marginTop: "30px"}}>
            <span>{window.gsm.options.flags.fullscreenSupport}</span>
            <input type="checkbox" checked={!view.staticOverlay} onChange={e => {
              pushView({override: {staticOverlay: !view.staticOverlay}})
            }}/>
          </div>
          <div className="field">
            <span>{window.gsm.command.preservePitch}</span>
            <input type="checkbox" checked={!view.freePitch} onChange={e => {
              pushView({override: {freePitch: !view.freePitch}})
            }}/>
          </div>
          <div className="field">
            <div className="labelWithTooltip">
              <span>{window.gsm.options.flags.ghostMode}</span>
              <Tooltip tooltip={window.gsm.options.flags.ghostModeTooltip}/>
            </div>
            <input type="checkbox" checked={view.ghostMode} onChange={e => {
              pushView({override: {ghostMode: !view.ghostMode}})
            }}/>
          </div>
          <div className="field">
            <span>{window.gsm.options.flags.hideMediaView}</span>
            <input type="checkbox" checked={view.hideMediaView || false} onChange={e => {
              pushView({override: {hideMediaView: !view.hideMediaView}})
            }}/>
          </div>
          <IndicatorFlags/>
        </> : <button style={{marginTop: "20px"}}  onClick={e => setShowMore(true)}>...</button>}
      </div>
    </div>
  )
}


function IndicatorFlags(props: {}) {
  const [view, setView] = useStateView({indicatorInit: true})
  const init = view?.indicatorInit || {}


  return <>
    <div className="field" style={{marginTop: "30px"}}>
      <span>{window.gsm.token.indicator}</span>
    </div>
    <div className="field indent">
      <span>{window.gsm.token.color}</span>
      <div>
        <input type="color" value={init?.backgroundColor || INDICATOR_INIT.backgroundColor} onChange={e => {
          const indicatorInit = produce(init ?? {}, d => {
            d.backgroundColor = e.target.value
          })
          showIndicator(indicatorInit)
          pushView({override: {indicatorInit}})
        }}/>
        <input style={{marginLeft: "5px"}} type="color" value={init?.textColor || INDICATOR_INIT.textColor} onChange={e => {
          const indicatorInit = produce(init ?? {}, d => {
            d.textColor = e.target.value
          })
          showIndicator(indicatorInit)
          pushView({override: {indicatorInit}})
        }}/>
      </div>
    </div>
    <div className="field indent">
      <span>{window.gsm.token.size}</span>
      <SliderMicro 
        value={init?.scaling ?? INDICATOR_INIT.scaling} 
        onChange={v => {
          const indicatorInit = produce(init ?? {}, d => {
            d.scaling = v
          })
          showIndicator(indicatorInit)
          pushView({override: {indicatorInit}})
        }}
        default={INDICATOR_INIT.scaling}
        sliderMin={0.75}
        sliderMax={1.5}
        sliderStep={0.01}
      />
    </div>
    <div className="field indent">
      <span>{window.gsm.token.rounding}</span>
      <SliderMicro 
        value={init?.rounding ?? INDICATOR_INIT.rounding} 
        onChange={v => {
          const indicatorInit = produce(init ?? {}, d => {
            d.rounding = v
          })
          showIndicator(indicatorInit)
          pushView({override: {indicatorInit}})
        }}
        default={INDICATOR_INIT.rounding}
        sliderMin={0}
        sliderMax={4}
        sliderStep={0.01}
      />
    </div>
    <div className="field indent">
      <span>{window.gsm.token.offset}</span>
      <SliderMicro 
        value={init?.offset ?? INDICATOR_INIT.offset} 
        onChange={v => {
          const indicatorInit = produce(init ?? {}, d => {
            d.offset = v
          })
          showIndicator(indicatorInit)
          pushView({override: {indicatorInit}})
        }}
        default={INDICATOR_INIT.offset}
        sliderMin={0}
        sliderMax={4}
        sliderStep={0.01}
      />
    </div>
    <div className="field indent">
      <span>{window.gsm.token.duration}</span>
      <div className="col" style={{gridColumnGap: "10px"}}>
        <SliderMicro 
          value={init?.duration ?? INDICATOR_INIT.duration} 
          onChange={v => {
            const indicatorInit = produce(init ?? {}, d => {
              d.duration = v
            })
            pushView({override: {indicatorInit}})
          }}
          default={INDICATOR_INIT.duration}
          sliderMin={0.1}
          sliderMax={1.9}
          sliderStep={0.01}
          pass={{onMouseUp: v => showIndicator(init, true)}}
        />
        <button title="static" className={`toggle ${init?.static ? "active" : ""}`} onClick={e => {
          const indicatorInit = produce(init ?? {}, d => {
            d.static = !d.static
          })
          showIndicator(indicatorInit, true)
          pushView({override: {indicatorInit}})
        }}>S</button>
      </div>
    </div>
  </>
}


function showIndicator(init: IndicatorInit, realDuration?: boolean) {
  window.overlay = window.overlay || new Overlay(true)
  window.overlay.setInit({...init, duration: realDuration ? init?.duration : 3})
  window.overlay.show({text: "1.00", static: realDuration ? init.static : true})
}