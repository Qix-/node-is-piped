/*
	NOTE: The readme indicates there might be behavioral
	      differences between .in() and .out(). However,
	      halfway through development, it turns out there
	      are mostly confident indicators that do not
	      rely on this sort of distinction even on windows
	      and thus the current implementation (as of writing)
	      does not differentiate between the two.

	      However, I am keeping that distinction in the readme
	      there as a reservation for future version if they
	      ever need to make that distinction.

	      Sorry for any inconvenience (this entire module
	      is an inconvenience).
*/

const os = require('os');

if (os.platform() === 'win32') {
	const fs = require('fs');

	if (process.env.MSYSTEM === 'MSYS') {
		const msysPiped = fd => {
			let s;

			try {
				s = fs.fstatSync(fd);
			} catch (err) {
				if (err.code === 'EINVAL') {
					/*
						In cases where fstat()
						throws with EINVAL, of course
						it means it's not a pipe, but
						it doesn't mean the FD is invalid
						across all platforms, and instead
						may just mean the redirection is
						coming from /dev/null, which is NOT
						a "closed" descriptor on some systems.
						Therefore, we catch it and silently
						ignore it here (yes, this means truly
						invalid FD's might still give a
						non-error result - check the readme
						as it mentions this) in order to
						keep things cross-platform friendlier.
					*/
					return {
						piped: false,
						confident: true
					};
				}

				throw err;
			}

			if (s.dev !== 0) {
				/*
					Under MSYS, dev being something
					other than 0 means a heredoc (cmd <<< text)
					or a file redirection (cmd < file.txt)
					was used.

					We treat this as a confident non-pipe
					result to match *NIX system behavior.
				*/
				return {
					piped: false,
					confident: true
				};
			}

			if (s.blocks !== 512) {
				/*
					Under MSYS, in all cases I tested,
					the block count for interactve modes
					was 512, and differed only when a
					pipe existed.

					This test is... well, bad. So we
					flag it as unconfident.
				*/
				return {
					piped: true,
					confident: false
				};
			}

			/*
				No other tests can be run in this case,
				but there's no way to definitively prove
				that the descriptor is NOT a pipe.

				Therefore, it's marked as unconfident.
			*/
			return {
				piped: false,
				confident: false
			};
		};

		module.exports = {
			in: msysPiped,
			out: msysPiped
		};
	} else {
		const conhostPiped = fd => {
			let s;
			try {
				s = fs.fstatSync(fd);
			} catch (err) {
				if (err.code === 'EISDIR') {
					/*
						Not sure what kind of nonsense
						is going on here, but on powershell,
						cmd.exe AND cygwin, a completely
						un-redirected file descriptor
						is considered a directory.

						We catch that case here and supply
						a result. Otherwise, we treat it as
						a real error and throw.
					*/
					return {
						piped: false,
						confident: true
					};
				}

				throw err;
			}

			/*
				Otherwise, check that dev is zero,
				which if not indicates a file/heredoc redirection.

				The fact we didn't get an EISDIR error indicates
				that the descriptor is piped OR redirected to
				*something*. However, to match *NIX functionality,
				we differentiate between a file/heredoc redirect
				and something else (which, so far, is only a pipe).

				Even though in all of my own testing this
				was a pretty dead-on result, I can't be
				sure I tested all edge cases and thus
				will still mark it as unconfident.
			*/
			return {
				piped: s.dev === 0,
				confident: false
			};
		};

		module.exports = {
			in: conhostPiped,
			out: conhostPiped
		};
	}
} else {
	/*
		On non-Windows systems, we assume
		that fstat() works with the file descriptors
		and that it will accurately report FIFO
		filemodes.

		This is the most confident approach to
		this problem and gives generally accurate
		results.
	*/

	const fs = require('fs');
	const tty = require('tty');

	const checkFIFO = fd => {
		const s = fs.fstatSync(fd);
		return {
			piped: !s.isDirectory() && s.isFIFO() && !tty.isatty(fd),
			confident: true
		};
	};

	module.exports = {
		in: checkFIFO,
		out: checkFIFO
	};
}
