#!/usr/bin/env python3
"""Convert Cloudfront pixel logs from benhoyt.com to combined log format for GoAccess."""

import argparse
import collections
import csv
import datetime
import fileinput
import os
import sys
import urllib.parse


# All Cloudfront log fields:
#   date time x-edge-location sc-bytes c-ip cs-method cs(Host)
#   cs-uri-stem sc-status cs(Referer) cs(User-Agent) cs-uri-query
#   cs(Cookie) x-edge-result-type x-edge-request-id x-host-header
#   cs-protocol cs-bytes time-taken x-forwarded-for ssl-protocol
#   ssl-cipher x-edge-response-result-type cs-protocol-version
#   fle-status fle-encrypted-fields

REQUIRED_FIELDS = [
    'date', 'time', 'c-ip', 'cs-uri-stem', 'cs(Referer)',
    'cs(User-Agent)', 'cs-uri-query', 'x-forwarded-for',
]
PIXEL_PATH = '/pixel.png'


def process_input(finput):
    """Process Cloudfront logs in given fileinput."""
    num_files = 0
    num_lines = 0
    num_output = 0
    for line in finput:
        if finput.isfirstline():
            field_names = None
            num_files += 1

        # Because .gz files are decoded as bytes
        if isinstance(line, bytes):
            line = line.decode('utf-8')

        # Process "Fields:" directive first
        line = line.rstrip()
        if line.startswith('#'):
            parts = line[1:].split(':', 1)
            if len(parts) != 2:
                log_error(finput, ': not found not # directive line')
                continue
            directive, value = parts
            value = value.strip()
            if directive == 'Fields':
                field_names = value.split()
            continue
        if field_names is None:
            log_error(finput, '#Fields directive not found at start of file')
            return False

        # Split into fields (it's tab-separated)
        num_lines += 1
        field_list = line.split('\t')
        if len(field_list) != len(field_names):
            log_error(finput, 'number of fields ({}) != expected number ({})'.format(
                len(field_list), len(field_names)))
            continue
        fields = dict(zip(field_names, line.split('\t')))

        # Ensure the fields we need are present
        missing_fields = [f for f in REQUIRED_FIELDS if f not in fields]
        if missing_fields:
            log_error(finput, 'missing fields: {}'.format(', '.join(missing_fields)))
            continue

        # Ensure it's a "pixel.png" request with "u" query param
        if fields['cs-uri-stem'] != PIXEL_PATH:
            continue
        query = urllib.parse.parse_qs(fields['cs-uri-query'])
        if 'u' not in query or not query['u'][0].startswith('%2F'):
            continue

        # Decode "u" (URL) and "r" (referrer) in query string
        path = urllib.parse.unquote(query['u'][0])
        referrer = urllib.parse.unquote(query.get('r', ['-'])[0])
        try:
            date = datetime.datetime.strptime(fields['date'], '%Y-%m-%d')
        except ValueError:
            log_error(finput, 'invalid date: {}'.format(fields['date']))
            continue
        user_agent = unquote(fields['cs(User-Agent)'])
        ip = fields['c-ip']
        if fields['x-forwarded-for'] != '-':
            ip = fields['x-forwarded-for']

        # Output in Apache/nginx combined log format
        print('{ip} - - [{date:%d/%b/%Y}:{time} +0000] {request} 200 - '
              '{referrer} {user_agent}'.format(
            ip=ip,
            date=date,
            time=fields['time'],
            request=quote('GET ' + path + ' HTTP/1.1'),
            referrer=quote(referrer),
            user_agent=quote(user_agent),
        ))
        num_output += 1

    print('processed {lines} lines from {files} files (avg {avg:.2f} lines/file), output {output} lines'.format(
        lines=num_lines,
        files=num_files,
        avg=num_lines / num_files,
        output=num_output,
    ), file=sys.stderr)


def quote(text):
    """Quote text for use in a combined log field."""
    if text == '-':
        return '-'
    return '"' + text.replace('"', '%22') + '"'


def unquote(text):
    """Unquote/unescape a Cloudfront log field."""
    # See https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html#LogFileFormat
    text = text.replace('%2522', '%25')
    text = text.replace('%255C', '%5C')
    text = text.replace('%2520', '%20')
    return urllib.parse.unquote(text)


def log_error(finput, message):
    """Log error message to stderr (with finput filename and line number)."""
    print('{}:{}: {}'.format(finput.filename(), finput.filelineno(), message),
          file=sys.stderr)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(usage='cloudfront_to_combined.py [-h] [dir | files ...]')
    parser.add_argument('dir_or_files', nargs='*',
                        help='directory of .gz files or list of files')
    parser.add_argument('--days', type=int, default=60,
                        help='number of days to go back (default %(default)s)')
    args = parser.parse_args()

    files = args.dir_or_files
    if len(files) == 1 and os.path.isdir(files[0]):
        dirname = files[0]
        start = datetime.datetime.now() - datetime.timedelta(days=args.days)
        files = []
        for name in os.listdir(dirname):
            if not name.endswith('.gz'):
                continue
            parts = name.split('.')
            try:
                date = datetime.datetime.strptime(parts[1][:10], '%Y-%m-%d')
            except (ValueError, IndexError):
                continue
            if date < start:
                continue
            files.append(os.path.join(dirname, name))

    finput = fileinput.input(files=files, openhook=fileinput.hook_compressed)
    sys.exit(0 if process_input(finput) else 1)
