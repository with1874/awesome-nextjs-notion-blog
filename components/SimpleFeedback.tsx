import React, { useState, useEffect, useRef } from 'react'
import format from 'comma-number'
import styles from './SimpleFeedback.module.css'

export function SimpleFeedback({ slug }) {
  // 初始化 feedback 变量
  const [count, setCount] = useState({
    awesome: 0,
    fingerHeart: 0,
    cool: 0,
    comeOn: 0,
    vegetableDog: 0
  })
  const [feedbacks, setFeedBacks] = useState(null)

  const uuidRef = useRef(null)
  const mountedRef = useRef(null)
  const isDirtyRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    import('device-uuid').then((mod) => {
      const uuid = new mod.DeviceUUID().get()
      uuidRef.current = uuid
      syncFeedback(uuid)
    })

    return () => {
      mountedRef.current = false
    }
  }, [slug])

  function syncFeedback(uuid) {
    fetch(`/api/feedbacks/${slug}?uuid=${uuid}`)
      .then((res) => res.json())
      .then(({ count: curCount, feedback: curFeedBack }) => {
        if (!mountedRef.current) return
        setCount(curCount || count)
        setFeedBacks(curFeedBack || [])
      })
  }

  function sendFeedback(feedback) {
    // Do nothing if `sendFeedback` is still processing
    if (isDirtyRef.current || !feedbacks) return

    // Optimistic update
    const newCount = { ...count }

    const index = feedbacks.indexOf(feedback)
    if (index !== -1 && newCount[feedback] > 0) {
      // 删除已有的 feedback
      feedbacks.splice(index, 1)
      newCount[feedback]--
    } else {
      // 增加 feedback
      newCount[feedback] = newCount[feedback] ? newCount[feedback] + 1 : 1
      feedbacks.push(feedback)
    }
    setCount(newCount)

    isDirtyRef.current = true

    fetch(`/api/feedbacks/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uuid: uuidRef.current,
        count: newCount,
        feedback: feedbacks
      })
    })
      .then(async () => {
        await syncFeedback(uuidRef.current)
      })
      .finally(() => {
        isDirtyRef.current = false
      })
  }

  return (
    <>
      <div className={styles.feedback}>
        <div className={styles['feedback-title']}>你觉得这篇文章怎么样？</div>
        <div className={styles['feedback-btns']}>
          {/* awesome */}
          <div
            className={styles['btn-item']}
            onClick={() => sendFeedback('awesome')}
          >
            <img src='/feedback-awesome.gif' alt='' width='60px' />
            <div className={styles['btn-text']}>
              YYDS{' '}
              {!count || (count.awesome > 0 && `(${format(count.awesome)})`)}
            </div>
          </div>
          {/* fingerheart */}
          <div
            className={styles['btn-item']}
            onClick={() => sendFeedback('fingerHeart')}
          >
            <img src='/feedback-fingerheart.gif' alt='' width='60px' />
            <div className={styles['btn-text']}>
              比心{' '}
              {!count ||
                (count.fingerHeart > 0 && `(${format(count.fingerHeart)})`)}
            </div>
          </div>
          {/* cool */}
          <div
            className={styles['btn-item']}
            onClick={() => sendFeedback('cool')}
          >
            <img src='/feedback-cool.gif' alt='' width='60px' />
            <div className={styles['btn-text']}>
              酷 {!count || (count.cool > 0 && `(${format(count.cool)})`)}
            </div>
          </div>
          {/* comeon */}
          <div
            className={styles['btn-item']}
            onClick={() => sendFeedback('comeOn')}
          >
            <img src='/feedback-comeon.gif' alt='' width='60px' />
            <div className={styles['btn-text']}>
              加油 {!count || (count.comeOn > 0 && `(${format(count.comeOn)})`)}
            </div>
          </div>
          {/* vegetabledog */}
          <div
            className={styles['btn-item']}
            onClick={() => sendFeedback('vegetableDog')}
          >
            <img src='/feedback-vegetabledog.gif' alt='' width='60px' />
            <div className={styles['btn-text']}>
              菜狗{' '}
              {!count ||
                (count.vegetableDog > 0 && `(${format(count.vegetableDog)})`)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
