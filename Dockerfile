FROM norgefajardo/k6:v0.37.0

WORKDIR /tmp

ADD script.js .

ENTRYPOINT ["k6"]

CMD [""]
