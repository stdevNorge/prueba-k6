FROM norgefajardo/k6:v0.37.0

WORKDIR /tmp

COPY script.js ./

ENTRYPOINT ["k6"]

CMD [""]
