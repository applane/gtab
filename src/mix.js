export function getBandName(bandSongExt) {
    return bandSongExt.substring(0, bandSongExt.indexOf(" - "));
}

export function getSongName(bandSongExt) {
    const match = bandSongExt.match(/ - (.*?)\.[^\.]*$/);
    return match ? match[1] : songName(bandSongExt);
}

function songName(songExt) {
    return songExt.replace(/\.[^.]+$/, '');
}
