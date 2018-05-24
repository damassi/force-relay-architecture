require('dotenv/config')

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const { execSync } = require('child_process')

const metaphysicsMissing = !fs.existsSync(
  path.join(__dirname, '../../metaphysics')
)

if (metaphysicsMissing) {
  console.log(
    chalk.red('[scripts/relayCompiler] ERROR:'),
    chalk.white(
      'Cannot find local copy of Metaphysics, which must exist alongside Force.',
      'See https://github.com/artsy/metaphysics for setup instructions.'
    )
  )

  process.exit(0)
}

const schemaMissing = !fs.existsSync(
  path.join(__dirname, '../data/schema.graphql')
)

if (schemaMissing) {
  console.log(
    '[scripts/relayCompiler] Running `yarn sync-schema` to download GraphQL schema from ' +
      `from ${process.env.METAPHYSICS_BASE_URL}...`
  )

  execSync('yarn sync-schema')
}

// prettier-ignore
const args = [
  '--extensions', 'js', 'jsx', 'ts', 'tsx',
  '--schema', path.resolve(__dirname, '../data/schema.graphql'),
  '--language', 'typescript',

  '--src', path.resolve(__dirname, '..'),
  '--artifactDirectory', './src/__generated__',

  '--include',
    'src/**',
    'node_modules/@artsy/reaction/src/**',

  '--exclude',
    'node_modules/@artsy/reaction/node_modules/**',

  '--no-watchman'
];

if (process.argv.includes('--watch')) {
  args.push('--watch')
}

if (process.argv.includes('--no-watchman')) {
  // use this flag if linking node modules
  args.push('--no-watchman')
}

const proc = spawn(
  path.resolve(__dirname, '../node_modules/.bin/relay-compiler'),
  args,
  { stdio: 'inherit' }
)

proc.on('close', code => {
  process.exit(code)
})
