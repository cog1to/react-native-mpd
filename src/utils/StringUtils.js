import unorm from 'unorm'

export const normalizeArtistName = (artist) => {
    const junk = [/^The /, /, The$/]

    let stripped = artist
    junk.forEach((token) => {
            stripped = stripped.replace(token, '')
    })

    normalized = unorm.nfd(artist).replace(/[\u0300-\u036f]/g, '').toLowerCase()

    return normalized.trim()
}

export const normalizeAlbumName = (album) => {
    const junk = ['OST', '(Original Motion Picture Soundtrack)', '(Original Game Soundtrack)', 'Soundtrack', /\[[a-zA-Z0-9\.\-]+\]$/mg, /\([a-zA-Z0-9\.\-]+\)$/mg]

    let stripped = album
    junk.forEach((token) => {
            stripped = stripped.replace(token, '')
    })

    return stripped.trim()
}

export const sanitize = (string) => {
    let output = string

    var quotesRegex = /\"/gi
    output = output.replace(quotesRegex, '\\"')

    var singleQuotesRegex = /\'/gi
    output = output.replace(singleQuotesRegex, '\\\'')

    return output
}
