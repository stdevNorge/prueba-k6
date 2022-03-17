FROM loadimpact/k6

WORKDIR /tmp

COPY test.js ./

ENTRYPOINT ["k6 /tmp/test.js"]
