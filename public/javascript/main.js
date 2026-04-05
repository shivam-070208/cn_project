const newmeetbtn = document.querySelectorAll('#newmeet');
const joinmeet = document.querySelector('.joinmeet');

let creating = false;
newmeetbtn.forEach((newmeetbtn)=>{

    newmeetbtn.addEventListener('click', async (e) => {
        if (creating) return;
        creating = true;
        let value =e.target.textContent
        e.target.textContent = "creating.....";
        
        try {
            const response = await fetch('/api/create', { method: "POST" });
            if (!response.ok) throw new Error("Failed to create meeting");
            
            const data = await response.json(); 
             e.target.textContent =value;
            creating = false;
           
            window.location.href = `${window.origin}/meet?id=${data.data}`;  
        } catch (error) {
            console.error(error);
            e.target.textContent = "Error! Try again.";
            e.target.textContent =value;
            creating = false;
        }
    });
})
joinmeet.addEventListener('click', async (e) => {
    if (creating) return;
    creating = true;
    let value =e.target.textContent
    e.target.textContent = "joining.."
    
    const input = document.querySelector('.inputmeetid').value
   
      
       
        window.location.href = `${window.origin}/meet?id=${input}`;  
   
        
        e.target.textContent = "Error! Try again.";
        e.target.textContent =value;
        creating = false;

});