import { normalizeAlbumName, normalizeArtistName } from '../utils/StringUtils'

export default class CoverArtArchive {
	constructor() {
		this.musicBrainzApiBase = 'https://musicbrainz.org/ws/2/release-group?query='
		this.coverArtApiBase = 'https://coverartarchive.org/release-group/'
	}

	getReleaseGroupId(artist, album) {

		let params = []
	
		if (artist) {
			params.push('artistname:' + artist)
		}

		if (album) {
			// TODO: refactor and put this into a separate class/file.			
			params.push('release:' + normalizeAlbumName(album))
		}

		const paramString = params.join('%20AND%20')
	
		const finalUrl = this.musicBrainzApiBase + paramString + '&fmt=json'
		return fetch(finalUrl)
	}

	getReleaseArtList(releaseGroupId) {
		return fetch(this.coverArtApiBase + release-group + '/')
	}

	getArtUrl(artist, album) {
		return this.getReleaseGroupId(artist, album)
			.then((response) => {
				return response.json()
			})
			.then((response) => new Promise((resolve, reject) => {
				if (response['release-groups'].length > 0) {
					const id = response['release-groups'][0]['id']
					resolve('https://coverartarchive.org/release-group/' + id)
				} else {
					reject()
				}
			}))
			.then((url) => { return fetch(url) })
			.then((response) => {
				return response.json()
			})
			.then((json) => new Promise((resolve, reject) => {
				if (json['images'].length > 0) {
					const fronts = json['images'].filter(imageDesc => imageDesc['front'] === true)
					if (fronts.length > 0) {
						resolve(fronts[0]['thumbnails']['large'])
						return
					}
				}
		
				reject()
			}))
	}
}
