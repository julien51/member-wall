import React from "react"
import express from "express"
import { renderToString } from "react-dom/server"
import fetch from "node-fetch"
import ColorScheme from "color-scheme"

/**
 * Query to get members
 * TODO: see why we only get 100 results
 * TODO: handle pagination
 * TODO: handle sorting
 * @param {*} locks
 */
const query = locks => `{
    locks(first:999 where: {
      address_in: ${JSON.stringify(locks)}
    }) {
    keys {
      owner {
        address
      }
      keyId
      expiration
    }
    name
    address
  }
}`

/**
 * Returns all of the keys for a given lock
 */
const getMembers = async locks => {
  console.log(locks)
  const response = await fetch(
    "https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock",
    {
      method: "POST",
      body: JSON.stringify({ query: query(locks) })
    }
  ).then(res => res.json())
  return response.data.locks
    .map(lock => {
      return lock.keys.map(key => {
        return {
          ...key,
          owner: key.owner.address,
          lockAddress: lock.address,
          lockName: lock.name
        }
      })
    })
    .reduce((a, v) => {
      return [...v, ...a]
    }, [])
}

/**
 * Original Icon
 */
const originalIcon = [
  { x: 195.75, y: 114.75 },
  { x: 33.75, y: 162 },
  { x: 121.5, y: 0 }
]

const stripedIcon = [{ x: 108, y: 108 }, { x: 146, y: 147 }, { x: 216, y: 216 }]
const chompIcon = [{ x: 108, y: 108 }, { x: 108, y: -64 }, { x: 108, y: 280 }]
const biteIcon = [{ x: 108, y: 108 }, { x: 108, y: 0 }, { x: 108, y: 216 }]
const tailIcon = [{ x: 108, y: 108 }, { x: 64, y: 0 }, { x: 64, y: 216 }]
const triadIcon = [{ x: 108, y: 108 }, { x: 32, y: 0 }, { x: 32, y: 216 }]

/**
 * This selects a set of 3 circles (specified by position) to use to construct the lock icon.
 * @param {string} address
 * @returns {object}
 */
function circles(address) {
  const options = [
    originalIcon,
    stripedIcon,
    chompIcon,
    biteIcon,
    tailIcon,
    triadIcon
  ]
  const n = parseInt(address) % options.length
  return options[n]
}

/**
 * This computes how much rotation to apply to the lock glyph
 * @param {string} address
 * @returns {number}
 */
function degreesOfRotation(address) {
  const n = parseInt(address)
  return (n % 36) * 10
}

/**
 * This returns either instructions to mirror the icon and then translate it back to
 * the origin, or do nothing depending on lock address.
 * @param {string} address
 * @returns {string}
 */
function translateAndScale(address) {
  const n = parseInt(address)
  return n % 2 == 0 ? "" : "tranlate(216, 0) scale(-1, 1)"
}

/**
 * Renders a member
 * @param {*} param0
 */
const Member = ({ member, width }) => {
  /**
    {
     expiration: '1580440822',
      keyId: '189',
      owner: '0xa928703202ebb3fe9c4bae53e95e6084d7b8c042',
      lockAddress: '0xb0ad425ca5792dd4c4af9177c636e5b0e6c317bf',
      lockName: 'ETHWaterloo'
    }
   */

  const scheme = new ColorScheme()
  let colors = ["#8c8c8c", "#e8e8e8", "#c3c3c3"]
  let address = "0x000000"
  address = member.owner
  const mainColor = address.substring(2, 8).toUpperCase()
  scheme
    .from_hex(mainColor)
    .scheme("triade")
    .variation("pastel")
  colors = scheme.colors().map(c => `#${c}`)
  const innerCircles = circles(address)

  const viewBox = `0 0 ${width} ${width}`
  return (
    <svg
      viewBox="0 0 216 216"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width * 1.5}
      height={width * 1.5}
    >
      <defs>
        <circle id="a" cx={108} cy={108} r={108} />
        <circle id="c" cx={108} cy={108} r={60.75} />
      </defs>
      <g>
        <mask id="b" fill="#fff">
          <use xlinkHref="#a" />
        </mask>
        <g
          transform={
            "rotate(" +
            degreesOfRotation(address) +
            ", 108, 108)" +
            translateAndScale(address)
          }
        >
          <circle
            fill={colors[0]}
            mask="url(#b)"
            cx={innerCircles[0].x}
            cy={innerCircles[0].y}
            r="114.75"
          />
          <circle
            fill={colors[1]}
            mask="url(#b)"
            cx={innerCircles[1].x}
            cy={innerCircles[1].y}
            r="114.75"
          />
          <circle
            fill={colors[2]}
            mask="url(#b)"
            cx={innerCircles[2].x}
            cy={innerCircles[2].y}
            r="114.75"
          />
        </g>
        <mask id="d" fill="#fff">
          <use xlinkHref="#c" />
        </mask>
        <use fill="#FFF" xlinkHref="#c" />
        <path
          d="M121.179 116.422c-.001.895-.05 1.797-.168 2.683-1.047 7.845-9.512 12.951-17.006 10.275-5.482-1.958-8.917-6.786-8.921-12.582-.003-3.972-.003-7.944-.003-11.916h26.103c-.001 3.847-.002 7.694-.005 11.54m16.198-34.477V81h-16.335v16.198H94.936l.001-15.26v-.918h-16.28c-.014.196-.035.34-.035.483.001 5.232-.012 10.463-.019 15.695H74.25v7.694h4.353c.004 4.167.015 8.334.05 12.5.07 8.231 3.508 15.052 9.88 20.2 9.188 7.422 19.562 9 30.636 4.94 10.486-3.846 18.35-13.87 18.231-26.081-.037-3.853-.05-7.706-.054-11.559h4.404v-7.694h-4.4c.01-5.085.027-10.17.027-15.253"
          fill={colors[0]}
          mask="url(#d)"
        />
      </g>
    </svg>
  )
}

/**
 * Renders the SVG based
 */
const Members = ({ members, maxWidth, maxHeight, urlTemplate }) => {
  const totalMembers = members.length
  const totalSurface = maxWidth * maxHeight

  // It needs to be at most the squareroot
  let maxMemberSide = Math.sqrt(totalSurface / totalMembers)
  // maxMemberSide needs to be the largest divider of maxWidth that's small than memberSide
  const byRow = Math.ceil(maxWidth / maxMemberSide)
  const totalWidth = maxMemberSide * byRow
  maxMemberSide = maxMemberSide - (totalWidth - maxWidth) / byRow

  const numberOfRows = Math.ceil(totalMembers / byRow)
  const totalHeight = maxMemberSide * numberOfRows

  if (totalHeight > maxHeight) {
    maxMemberSide = maxMemberSide - (totalHeight - maxHeight) / numberOfRows
  }

  const memberSide = maxMemberSide

  return (
    <svg height={maxHeight} width={maxWidth}>
      {members.map((member, index) => {
        const x = index % byRow
        const y = Math.floor(index / byRow)
        const href = `https://etherscan.io/address/${member.owner}`
        return (
          <a key={member.owner} href={href}>
            <svg x={x * memberSide} y={y * memberSide}>
              <Member width={memberSide / 2} member={member} />
            </svg>
          </a>
        )
      })}
    </svg>
  )
}

module.exports = async (req, res) => {
  let locks = []
  if (req.query.locks) {
    locks = req.query.locks.split(",")
  }
  if (!locks.length) {
    return res.status("422").send("Please make sure you have `locks=0x123`")
  }
  const maxWidth = req.query.maxWidth || 800
  const maxHeight = req.query.maxHeight || 500
  const members = await getMembers(locks)
  const content = renderToString(
    <Members maxWidth={maxWidth} maxHeight={maxHeight} members={members} />
  )
  res.setHeader("Content-Type", "text/html")
  res.status(200).send(content)
}