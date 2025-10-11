#!/bin/bash

echo -n "Input file: "
read input
echo -n "Output file: "
read output
ffmpeg -i $input -b:a 16k -ar 8000 -af acrusher=level_in=1:level_out=1:bits=4:mode=lin:aa=1 $output
