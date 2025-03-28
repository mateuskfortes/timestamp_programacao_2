const ShowTime = ({label, content}: {label: string, content: string}) => {
    return (
        <p>{label}: <span>{content}</span></p>
    )
}

export default ShowTime