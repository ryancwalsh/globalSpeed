
import { useState } from "react"
import produce from "immer"
import "./URLModal.scss"
import { ModalBase } from "../comps/ModalBase"
import { URLCondition } from "../types"
import { checkURLCondition } from "../utils/configUtils"
import { ThrottledTextInput } from "../comps/ThrottledTextInput"
import { GoX } from "react-icons/go"
import { getDefaultURLConditionPart } from "../defaults"
import cloneDeep from "lodash.clonedeep"
import { randomId } from "../utils/helper"

type Props = {
  onClose: () => void,
  onChange: (value: URLCondition) => void,
  onReset: () => void, 
  value: URLCondition,
  neutralValue?: boolean
}

export function URLModal(props: Props) {
  const { value } = props  
  const [test, setTest] = useState("example.com")
  const [result, setResult] = useState(null as boolean)

  return <ModalBase onClose={props.onClose}>
    <div className="URLModal">
      <div className="header">
        <div>{window.gsm.options.rules.header}</div>
        <select onChange={e => {
          props.onChange(produce(value, d => {
            d.matchAll = e.target.value === "all"
          }))
        }} value={value.matchAll ? "all" : "any"}>
          <option value="any">{`${window.gsm.token.any || "any"} (OR)`}</option>
          <option value="all">{`${window.gsm.token.all || "all"} (AND)`}</option>
        </select>
      </div>
      <div className="parts">
        {value.parts.map((part, i) => {
          const changePart = (v: typeof part) => {
            props.onChange(produce(value, d => {
              d.parts[i] = v 
            }))
          }

          const remove = () => {
            props.onChange(produce(value, d => {
              d.parts.splice(i, 1)
            }))
          }

          return (
            <div key={part.id}>
              <input type="checkbox" checked={!part.disabled} onChange={() => {
                changePart(produce(part, d => {
                  d.disabled = !d.disabled
                }))
              }}/>
              <select value={part.inverse ? "!=" : "=="} onChange={e => {
                changePart(produce(part, d => {
                  d.inverse = e.target.value === "!="
                }))
              }}>
                <option value="==">==</option>
                <option value="!=">!=</option>
              </select>
              <select value={part.type} onChange={e => {
                changePart(produce(part, d => {
                  const option = e.target.value as any 

                  // on matchType change, revert URL value to an example. 
                  if (option !== d.type) {
                    if (option === "REGEX") {
                      d.value = String.raw`twitch\.tv`
                    } else if (option === "CONTAINS") {
                      d.value = "twitch.tv"
                    } else if (option === "STARTS_WITH") {
                      d.value = String.raw`https://www.twitch.tv`
                    } 
                  }

                  d.type = option as any 
                }))
              }}>
                <option value={"STARTS_WITH"}>{window.gsm.options.rules.startsWith}</option>
                <option value={"CONTAINS"}>{window.gsm.options.rules.contains}</option>
                <option value={"REGEX"}>{window.gsm.options.rules.regex}</option>
             </select>
              <ThrottledTextInput value={part.value} onChange={newValue => {
                changePart(produce(part, d => {
                  d.value = newValue
                }))
              }}/>
              <button className="close icon" onClick={remove}>
                <GoX size="23px"/>
              </button>
            </div>
          )
        })}
      </div>
      <div className="controls">
        <button onClick={e => {
          props.onChange(produce(value, d => {
            d.parts.push(getDefaultURLConditionPart())
          }))
        }}>{window.gsm.token.create}</button>
        <button onClick={props.onReset}>{window.gsm.token.reset}</button>
        <div className="right">
          <button onClick={() => {
            (window as any).copiedUrlModal = cloneDeep(value)
          }}>{window.gsm.token.copy}</button>
          <button onClick={() => {
            const newValue = (window as any).copiedUrlModal as URLCondition
            if (newValue) {
              props.onChange(produce(newValue, d => {
                d.parts.forEach(part => {
                  part.id = randomId()
                })
              }))
            }
          }}>{window.gsm.token.paste}</button>
        </div>
      </div>
      <div className="test">
        <input type="text" value={test} onChange={e => {
          setTest(e.target.value)
        }}/>
        <button onMouseDown={e => {
          if (e.button !== 0) return 
          setResult(null)
        }} className={result ? "passed" : result == null ? "" : "failed"} onAnimationEnd={e => {
          setResult(null)
        }} onClick={() => {
          
          // East asian stock markets, red = good, green/blue = bad. To avoid confusion, use thumbs up. 
          if (window.gsm.token.create === "创建" || window.gsm.token.create === "作成" || window.gsm.token.create === "창조하다") {
            alert(checkURLCondition(test, value, props.neutralValue || false) ? "👍 PASSED" : "👎 FAILED")
          } else {
            setResult(checkURLCondition(test, value, props.neutralValue || false))
          }
        }}>test</button>
      </div>
    </div>
  </ModalBase>
}
