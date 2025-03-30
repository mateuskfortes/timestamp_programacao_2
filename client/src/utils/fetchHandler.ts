const ORIGIN = import.meta.env.MODE === 'development' ? import.meta.env.VITE_ORIGIN : window.location.origin

const fetchHandler = async (url: string,
                            method: 'GET' | 'POST',
                            okFunc: ({data, response}: {data?: any, response?: any}) => void
) => {
    const response = await fetch(`${ORIGIN}/${url}`, {
        method: method
    })

    // Tenta recuperar dados do corpo da resposta
    let data;  
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (response.ok) {
        okFunc({response, data})
        return true
    }
}

export default fetchHandler