#!/bin/sh

PORT=${1:-80}

cmd() {
  return $(curl --output /dev/null --silent --head --fail http://localhost:$PORT)
}

if cmd; then
  STATUS=0
else
  STATUS=1
fi

if [ $STATUS -eq 1 ]; then
  TRIES=0
  SLEEP=100
  TIMEOUT=${2:-10}

  echo "Trying to reach http://localhost:${PORT} for ${TIMEOUT}s with a delay of ${SLEEP}ms"

  SLEEP=$(echo "scale=3; ${SLEEP} / 1000" | bc -q 2>/dev/null)
  TIMEOUT=$(echo "scale=0; ${TIMEOUT} / ${SLEEP}" | bc -q 2>/dev/null)

  echo "Each cycle will be ${SLEEP}s and we will timeout at ${TIMEOUT} cycles"

  until [ $STATUS -eq 0 ]; do
    if cmd; then
      STATUS=0
      echo ""
    fi
    printf '.'
    sleep .1
    TRIES=$(( $TRIES+1 ))
    if [ $TRIES -gt $TIMEOUT ]; then
      echo ""
      echo "TIMEOUT"
      echo ""
      exit 1
    fi
  done
fi

echo "CONNECTED"
echo ""
