import "@tanstack/react-start/server-only"

import { lookup } from "node:dns/promises"
import { Agent } from "node:https"
import { isIP } from "node:net"
import ipaddr from "ipaddr.js"

function isPublicPushAddress(value: string): boolean {
  if (!isIP(value) || value.includes("%")) return false
  const address = ipaddr.parse(value)
  if (address.range() !== "unicast") return false
  // Exclude IPv6 transition/translation and unallocated non-global ranges too.
  return address.kind() === "ipv4" || address.match(ipaddr.parse("2000::"), 3)
}

function createPushAgent(hostname: string, signal: AbortSignal): Agent {
  return new Agent({
    keepAlive: false,
    maxSockets: 1,
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
    lookup: (requestedHost, options, callback) => {
      if (requestedHost !== hostname || signal.aborted) {
        callback(new Error("Push destination lookup was refused."), [])
        return
      }
      void lookup(hostname, { all: true, verbatim: true }).then(
        (addresses) => {
          if (signal.aborted) {
            callback(new Error("Push destination lookup timed out."), [])
            return
          }
          if (
            addresses.length === 0 ||
            addresses.some(
              (item) =>
                !isPublicPushAddress(item.address) ||
                isIP(item.address) !== item.family
            )
          ) {
            callback(
              new Error(
                "Push destination did not resolve to public addresses."
              ),
              []
            )
            return
          }
          const family = Number(options.family) || 0
          const candidates = addresses.filter(
            (item) => !family || item.family === family
          )
          if (candidates.length === 0) {
            callback(new Error("Push destination has no usable address."), [])
            return
          }
          // Supply these exact checked addresses to the socket. Do not resolve
          // again after validation; preserve the hostname for TLS verification.
          if (options.all) callback(null, candidates)
          else callback(null, candidates[0].address, candidates[0].family)
        },
        () => callback(new Error("Push destination lookup failed."), [])
      )
    },
  })
}

export { createPushAgent, isPublicPushAddress }
