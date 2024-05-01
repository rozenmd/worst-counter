import shellac from 'shellac'

console.log(
	await shellac`
	$$ pwd
`,
)

async function trace(route: string) {
	const { stdout: cf_trace_id } = await shellac`
		$ cloudflared access curl https://tracegen.cfperf.net/ -s | htmlq --text '#trace-id'
	`
	// console.log({ cf_trace_id })

	const before = performance.now()
	await shellac`
		$ curl -s https://worst-counter.glen.workers.dev${route} -H 'cf-trace-id: ${cf_trace_id}'
	`
	const after = performance.now()
	return { duration: after - before, cf_trace_id }
}

while (true) {
	for (let i = 0; i < 5; i++) {
		{
			const { duration, cf_trace_id } = await trace('/inc')
			if (duration > 1000) console.log(`⚠️⚠️⚠️ SLOW REQUEST ⚠️⚠️⚠️`)
			console.log(
				`INCREMENT took ${Math.round(
					duration,
				)}ms: https://tracing.cfdata.org/trace/${cf_trace_id.split(':')[0]}`,
			)
		}

		{
			const { duration, cf_trace_id } = await trace('/')
			if (duration > 1000) console.log(`⚠️⚠️⚠️ SLOW REQUEST ⚠️⚠️⚠️`)
			console.log(
				`READ      took ${Math.round(
					duration,
				)}ms: https://tracing.cfdata.org/trace/${cf_trace_id.split(':')[0]}`,
			)
		}
	}
	console.log("Letting DO go to sleep")
	await new Promise(res => setTimeout(res, 30_000))
}
