import React, {useState} from 'react';

const ICSUpload = ({onEventsImported}) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!file) {
            alert('Please select a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('ics', file);

        const options = {
            method: 'POST',
            body: formData,
            credentials: 'include'
        }

        try{
            const response = await fetch('http://localhost:3000/calendar/import-ics', options);
            const data = await response.json();
            if(response.ok) {
                alert('Eevnts imported successfully!');
                onEventsImported(data);
            } else {
                alert(`Failed to import events: ${data.error}`);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Please try again.');
        }
    };

    return (
        <div>
            <h2> Import Events from ICS FIle</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".ics" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
        </div>
    )
}

export default ICSUpload;
