#!/usr/bin/env bash
aws s3 sync s3://benhoyt-com-pixel-logs/ _logs/ --profile=home
_scripts/cloudfront_to_combined.py _logs/*.gz > _logs/combined.log
goaccess _logs/combined.log -o _logs/report.html --log-format=COMBINED
open _logs/report.html
