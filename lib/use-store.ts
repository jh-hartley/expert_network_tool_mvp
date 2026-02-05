"use client"

import { useCallback, useSyncExternalStore } from "react"
import type { EntityType, EntityMap } from "./types"
import { getAll, upsert, remove, ensureSeeded } from "./storage"

/* ------------------------------------------------------------------ */
/*  React hook that stays in sync with localStorage                   */
/*  Uses useSyncExternalStore for tear-free reads.                    */
/* ------------------------------------------------------------------ */

let listeners: Array<() => void> = []

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.push(cb)
  return () => {
    listeners = listeners.filter((l) => l !== cb)
  }
}

/** Notify all hooks that data changed (call after any write). */
export function notifyStoreChange() {
  emit()
}

export function useStore<K extends EntityType>(type: K) {
  ensureSeeded()

  const data = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getAll(type)),
    () => "[]",
  )

  const items: EntityMap[K][] = JSON.parse(data)

  const add = useCallback(
    (record: EntityMap[K]) => {
      upsert(type, record)
      emit()
    },
    [type],
  )

  const update = useCallback(
    (record: EntityMap[K]) => {
      upsert(type, record)
      emit()
    },
    [type],
  )

  const del = useCallback(
    (id: string) => {
      remove(type, id)
      emit()
    },
    [type],
  )

  return { items, add, update, del } as const
}
