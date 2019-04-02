import * as types from './types'

export const connect = (host, port) => ({
	type: types.CONNECT,
	host,
	port,
})

export const connected = (status) => ({
	type: types.CONNECTED,
	connected: status
})

export const connectionError = (error) => ({
	type: types.CONNECTION_ERROR,
	error,
})

export const getStatus = (source) => ({
	type: types.GET_STATUS,
	source,
})

export const statusUpdated = (status, source) => ({
	type: types.STATUS_UPDATED,
	status,
	source,
})
