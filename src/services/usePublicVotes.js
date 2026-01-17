import { ref } from 'vue'
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase'

export function usePublicVotes() {
    const votes = ref([])
    const toasts = ref([])
    const seenIds = new Set()

    let unsubscribe = null
    let initialized = false

    function pushToast(vote) {

        if (toasts.value.length >= 5) return

        toasts.value.push(vote)

        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== vote.id)
        }, 6000)
    }

    function listen() {
        if (unsubscribe) return

        const q = query(
            collection(db, 'transactions'),
            where('isPublicVote', '==', true),
            where('mpPaymentId', '!=', null),
            orderBy('createdAt', 'desc'),
            limit(50)
        )

        unsubscribe = onSnapshot(q, snap => {
            snap.docChanges().forEach(change => {
                

                const vote = {
                    id: change.doc.id,
                    ...change.doc.data()
                }

                if (seenIds.has(vote.id)) return
                seenIds.add(vote.id)

                votes.value.unshift(vote)

                // 🔔 toast só depois da carga inicial
                if (initialized) {
                    pushToast(vote)
                }
            })

            initialized = true
        })
    }

    function stop() {
        if (unsubscribe) {
            unsubscribe()
            unsubscribe = null
        }
    }

    return {
        votes,
        toasts,
        listen,
        stop
    }
}
