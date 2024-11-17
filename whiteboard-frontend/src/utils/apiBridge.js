
const makeApiRequest = async ({route, method, headers, body}) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        if (body) {
            options.body = JSON.stringify(body)
    }};
    try {
        fetch(route, options)
            .then((res) => res.json().then(data => ({ status: res.status, body: data })))
            .then(({ status, body }) => {
                if (status === 200) {
                    console.log('Success:');
                    return body;

                } else {
                    console.error('Error:', body.message);
                }
            })
            .catch((err) => {
                console.error('Error:', err);
            });
        
    } catch (err) {
        console.error('Error:', err);
    }


}

export default makeApiRequest;