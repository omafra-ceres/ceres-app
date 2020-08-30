import React from 'react'
import { placeholderIfNull } from '.'

const queryOperators = {
  "=": {
    label: "is",
    check: check => val => placeholderIfNull(val).toString() === check,       
  },
  "!=": {
   label: "is not",
    check: check => val => placeholderIfNull(val).toString() !== check,       
  },
  ">": {
    label: "greater than",
    check: check => val => (placeholderIfNull(val, 1) * 1) > check,       
  },
  "<": {
    label: "less than",
    check: check => val => (placeholderIfNull(val, 1) * 1) < check       
  }
}

const sortByType = {
  number: {
    "1": { label: "1 - 9", sort: (a, b) => a - b },
    "-1": { label: "9 - 1", sort: (a, b) => b - a }
  },
  string: {
    "1": { label: "A - Z", sort: (a, b) => a.localeCompare(b) },
    "-1": { label: "Z - A", sort: (a, b) => b.localeCompare(a) }
  },
  boolean: {
    "1": { label: "F - T", sort: (a, b) => a - b },
    "-1": { label: "T - F", sort: (a, b) => b - a }
  }
}

const getFilterFunctions = (filtersObject, template) => {
  const { projection={}, sort={}, query={} } = filtersObject
  
  const getProjection = columns => {
    if (!projection.op) return columns
    
    return Object.keys(columns).filter(key => {
      const isIn = projection.columns.includes(key)
      return projection.op === 1 ? isIn : !isIn
    }).reduce((obj, key) => ({...obj, [key]: columns[key]}), {})
  }

  const sortRows = rows => {
    if (!Object.keys(sort).length) return rows

    const columns = Object.keys(sort).map(col => {
      const { type } = template.properties[col]
      const func = sortByType[type][sort[col]].sort
      return { col, func }
    })
    
    return rows.sort((row1, row2) => {
      const row1Items = row1.data_values
      const row2Items = row2.data_values
      
      let order = 0, index = 0, done = false
      while (index < columns.length && !done) {
        const { col, func } = columns[index]
        const check = func(row1Items[col], row2Items[col])
        if (check) {
          order = check
          done = true
        }
        index++
      }
      return order
    })
  }

  const filterRows = rows => {
    if (!Object.keys(query)) return rows
    
    const queries = Object.keys(query).map(col => {
      const [op, check] = query[col].split(/ (.+)/)
      const func = queryOperators[op].check(check)
      return { col, func }
    })
    
    return rows.filter(row => (
      queries.every(que => que.func(row.data_values[que.col]))
    ))
  }

  const filterAndSortRows = rows => sortRows(filterRows(rows))

  return [ getProjection, filterAndSortRows ]
}

const addFilter = (filters, type, column, op) => {
  const newFilters = JSON.parse(JSON.stringify(filters))

  if (type === "projection") {
    newFilters.projection = {
      op,
      columns: [...(newFilters.projection || {}).columns || [], column]
    }
  } else {
    newFilters[type] = {
      ...newFilters[type],
      [column]: op
    }
  }

  return newFilters
}

const removeFilter = (filters, type, column) => {
  const newFilters = JSON.parse(JSON.stringify(filters))
  if (type === "projection") {
    newFilters.projection.columns = []
  } else {
    delete newFilters[type][column]
  }
  return newFilters
}

const getProjectionList = (projection, properties, expanded=false) => {
  const op = projection.op === 1 ? "Show" : "Hide"
  const cols = projection.columns

  if (expanded) {
    return cols.map(col => ({
      type: "projection",
      html: <>{ op }&nbsp;column&nbsp;<strong>{ properties[col].title }</strong></>
    }))
  }

  const label = cols.length > 1
    ? `${cols.length} columns`
    : properties[cols[0]].title
  
  return [{
    type: "projection",
    html: <>{op}&nbsp;<strong>{ label }</strong></>
  }]
}

const getSortList = (sort, properties, expanded=false) => {
  return Object.keys(sort).map(col => {
    const { title, type } = properties[col]
    const label = sortByType[type][sort[col]].label
    return {
      type: "sort",
      column: col,
      html: <>Sort{ expanded ? " column" : "" }&nbsp;<strong>{title}</strong>&nbsp;{label}</>
    }
  })
}

const getQueryList = (query, properties, expanded=false) => {
  return Object.keys(query).map(col => {
    const { title } = properties[col]
    const [ op, check ] = query[col].split(/ (.+)/)
    const label = queryOperators[op].label
    return {
      type: "query", 
      column: col, 
      html: <>{ expanded ? "Filter where " : "" }<strong>{title}</strong>&nbsp;{label}&nbsp;<strong>{check}</strong></>
    }
  })
}

const getFilterList = (filters, template, expanded=false) => {
  const { projection, sort, query } = filters
  const { properties } = template
  
  const proList = projection && (projection.columns || []).length
    ? getProjectionList(projection, properties, expanded)
    : []
  const sortList = sort ? getSortList(sort, properties, expanded) : []
  const queryList = query ? getQueryList(query, properties, expanded) : []

  return [ ...proList, ...sortList, ...queryList ]
}

export { 
  getFilterFunctions,
  removeFilter,
  addFilter,
  getFilterList
}