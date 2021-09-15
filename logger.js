const {createLogger, transports, format} = require("winston");
const { v4: uuidv4 } = require('uuid');

const {combine, timestamp, label, prettyPrint } = format;

const serverSessionId = process.env.SESSION_ID || uuidv4();

let transportsConf = [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
];

if(process.env.NODE_ENV !== "production"){
    transportsConf.push(new transports.Console());
}

const logger = createLogger({
  level: 'info',
    format:  combine(
	label({label: `sessionId: ${serverSessionId}`}),
	timestamp(),
	prettyPrint()
    ),
  defaultMeta: { service: 'definitions api' },
  transports: transportsConf,
});

module.exports = logger;

