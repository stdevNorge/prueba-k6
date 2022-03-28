FROM norgefajardo/k6:v0.37.0

WORKDIR /tmp

COPY test.js ./

ENTRYPOINT ["k6 /tmp/test.js"]
