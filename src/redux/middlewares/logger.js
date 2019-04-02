export const loggerMiddleware = (store) => (next) => (action) => {
	console.log('Redux log:', action)
	next(action)
}
