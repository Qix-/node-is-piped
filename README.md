# `is-piped`

Determines if a file descriptor is piped or not, across platforms.

```console
$ npm i is-piped
```

## Caveats

**PLEASE READ:** There are some major caveats to this module:

- This module favors false-negatives over false-positives. **Expect this
  module to report `false` even if a pipe exists**. This is an incredibly
  flaky and hard-to-get-right test, so detecting the use of pipes should
  be an enhancement, not a hard requirement. **You most likely should not
  use this module unless you're entirely sure what you're doing.**

- `.in()` might return true for a write-only descriptor. Conversely.
  `.out()` might return true for a read-only descriptor. The distinction
  is meant for certain special-case handling in certain environments/on
  certain systems.

- **There are no tests.** While every effort has been made to ensure
  this won't cause [demons to fly out of your nose](http://catb.org/jargon/html/N/nasal-demons.html),
  you should be very defensive around the callsites into this module.
  I cannot predict all of the wonky things that might happen now
  or in the future.

- **This module relies upon a _lot_ of implementation details.** This
  is less a caveat and more of an advisory notice. Continue at your
  own peril - there is no guarantee this will work in versions that
  predate or succeed this module's writing.

- In some cases, we can detect if it is a file redirection (_not_ a pipe)
  attached to a file descriptor. In such cases, `false` is returned.
  This is to match &ast;NIX functionality.

- In some cases, a **truly** closed/invalid file descriptor may still
  return a result instead of throwing. **Please check the validity of
  file descriptors before passing them to `is-piped`. _You have been
  warned._**

If you want to know how it works, the source code is very heavily commented
explaining how and why each method of detection works the way it does.
I do not pretend to know _why_ these differences exist - only that
they do.

## Supported Platforms

In theory, this module supports:

- Most **POSIX platforms** that properly report FIFO-mode files
  via the `fstat` call. This includes, but surely is not limited to,
  Linux and MacOS (running on *actual* Linux and MacOS installations,
  **not** Git for bash, which is **not** Linux).

- **Git for Windows / MSYS2**, though the check is _super_ weird
  and might actually give false positives depending on the MSYS
  version you're using. Please file issues where necessary.

- **CMD.exe, PowerShell on Windows, and CYGWIN**, though this check is
  _also_ super weird and might report false negatives/positives depending
  on the Node.js version being used or the Windows version.

## Usage

```javascript

const isPiped = require('is-piped');

console.log(isPiped.in(0));
console.log(isPiped.out(1));
console.log(isPiped.out(2));

/*
	{
		piped: true|false,     // Whether or not it's a pipe.
		confident: true|false  // Whether or not we're absolutely sure of that.
	}
*/
```

Any file descriptor can be passed in, though it is assumed
that the file descriptor is at least open and valid.

# License

Copyright &copy; 2020 by Josh Junon. Released under the [MIT License](LICENSE.txt).
