#!/bin/bash
sh -c 'mustache ./networks/'$1'.json subgraph.template.yaml > subgraph.yaml';
sh -c 'mustache ./networks/'$1'.json src/helpers/constants.template.ts > src/helpers/constants.ts';
