/**
 * Logger minimalista e sem dependências, com timestamp, níveis e cores ANSI.
 * Uso: const log = require('../utils/logger'); log.info('mensagem', { extra });
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

const COLORS = {
    debug: '\x1b[90m', // cinza
    info: '\x1b[36m', // ciano
    warn: '\x1b[33m', // amarelo
    error: '\x1b[31m', // vermelho
    reset: '\x1b[0m',
};

// Nível mínimo controlado por LOG_LEVEL (default: info)
const minLevel = LEVELS[(process.env.LOG_LEVEL || 'info').toLowerCase()] ?? LEVELS.info;

function format(level, message, meta) {
    const timestamp = new Date().toISOString();
    const color = COLORS[level] || '';
    const label = level.toUpperCase().padEnd(5);
    let line = `${color}[${timestamp}] ${label}${COLORS.reset} ${message}`;
    if (meta !== undefined) {
        line += ` ${typeof meta === 'string' ? meta : JSON.stringify(meta)}`;
    }
    return line;
}

function log(level, message, meta) {
    if (LEVELS[level] < minLevel) return;
    const stream = level === 'error' || level === 'warn' ? console.error : console.log;
    stream(format(level, message, meta));
}

module.exports = {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
};
