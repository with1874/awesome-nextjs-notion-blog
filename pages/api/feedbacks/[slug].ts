// import * as firestore from '@google-cloud/firestore'
import { NextApiRequest, NextApiResponse } from 'next'
import * as db from '@lib/db'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method === 'POST') {
    const { uuid, count, feedback } = req.body

    // const increment = firestore.FieldValue.increment(1)
    // const decrement = firestore.FieldValue.increment(-1)
    const slugRef = db.feedbacks.doc(req.query.slug.toString())
    const voterRef = db.db
      .collection(`/${db.collections.feedbacks}/${req.query.slug}/voters`)
      .doc(uuid)

    await db.db.runTransaction(async (tx) => {
      // const payload = {} as any

      //   default:
      //     console.log('trigger default: ', feedback)
      //     break
      tx.set(slugRef, { count }, { merge: true })
      // tx.set(slugRef, payload, { merge: true })
      tx.set(voterRef, { feedback }, { merge: true })
    })

    const data = (await slugRef.get()).data()

    return res.status(200).json({
      count: data.count
    })
  }

  if (req.method === 'GET') {
    const { slug, uuid } = req.query
    const [snapshot, voter] = await Promise.all([
      db.feedbacks.doc(slug.toString()).get(),
      db.db
        .collection(`/${db.collections.feedbacks}/${req.query.slug}/voters`)
        .doc(uuid.toString())
        .get()
    ])

    const { count } = snapshot.data() || {}
    const feedback = voter.data()?.feedback || null

    return res.status(200).json({ count: count, feedback })
  }
}
