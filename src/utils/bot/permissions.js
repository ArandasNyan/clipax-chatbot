/**
 * Utilitários de permissão baseados nas tags do tmi.js.
 *
 * Níveis de permissão (do maior para o menor):
 *   broadcaster > moderator > vip > subscriber > everyone
 */

/** @param {object} tags Tags da mensagem fornecidas pelo tmi.js */
function isBroadcaster(tags) {
    return Boolean(tags?.badges?.broadcaster) || tags?.['user-type'] === 'broadcaster';
}

/** @param {object} tags */
function isModerator(tags) {
    return Boolean(tags?.mod) || isBroadcaster(tags);
}

/** @param {object} tags */
function isVip(tags) {
    return Boolean(tags?.vip || tags?.badges?.vip) || isModerator(tags);
}

/** @param {object} tags */
function isSubscriber(tags) {
    return Boolean(tags?.subscriber) || isModerator(tags);
}

const LEVELS = {
    everyone: () => true,
    subscriber: isSubscriber,
    vip: isVip,
    moderator: isModerator,
    broadcaster: isBroadcaster,
};

/**
 * Verifica se o autor da mensagem atende ao nível de permissão exigido.
 *
 * @param {object} tags Tags da mensagem do tmi.js.
 * @param {keyof typeof LEVELS} [level='everyone'] Nível mínimo exigido.
 * @returns {boolean}
 */
function hasPermission(tags, level = 'everyone') {
    const check = LEVELS[level] || LEVELS.everyone;
    return check(tags);
}

module.exports = {
    isBroadcaster,
    isModerator,
    isVip,
    isSubscriber,
    hasPermission,
};
