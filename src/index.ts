export default {
	async fetch(
		request: Request,
		env: Env,
		_ctx: ExecutionContext
	): Promise<Response> {
		const pathname = new URL(request.url).pathname;
		if (pathname === '/inc') {
			await env.DB.prepare(
				'UPDATE counter SET count = count + 1 WHERE id=1;'
			).run();
			return new Response('OK');
		} else if (pathname === '/dec') {
			await env.DB.prepare(
				'UPDATE counter SET count = count - 1 WHERE id=1;'
			).run();
			return new Response('OK');
		} else {
			const queryResp = await env.DB.prepare(
				'SELECT * FROM counter WHERE id=1'
			).all();

			return new Response(JSON.stringify(queryResp.results[0], null, 2), {
				headers: { 'content-type': 'application/json' },
			});
		}
	},
	scheduled: async (
		_event: any,
		env: Env,
		_ctx: ExecutionContext
	): Promise<void> => {
		await env.SELF.fetch('https://self/inc');
	},
};
