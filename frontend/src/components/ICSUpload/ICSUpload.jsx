import React, {useState} from 'react';
import { handleICSParsing } from '../../utils/utils';

const ICSUpload = ({onEventsImported}) => {
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!file) {
            alert('Please select a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('ics', file);
        handleICSParsing(formData, onEventsImported);

    };

    return (
        <div>
            <h2> Import Events from ICS FIle</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".ics" onChange={(e) => setFile(e.target.files[0])} />
                <button type="submit">Upload</button>
            </form>
        </div>
    )
}

export default ICSUpload;
