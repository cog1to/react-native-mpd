import * as types from './ActionTypes'

export const connect = (host, port) => ({
	type: types.CONNECT,
	host,
	port,
})

export const statusUpdated = (status) => ({
	type: types.STATUS_UPDATED,
	status,
})

export const connected = () => ({
	type: types.CONNECTED,
})

export const connecctionError = (error) => ({
	type: types.CONNECTION_ERROR,
	error,
})
