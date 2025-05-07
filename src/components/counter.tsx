// "use client";

// import { useState } from "react";
// import { Button } from "antd";

// export const Counter = () => {
// 	const [count, setCount] = useState(0);

// 	return (
// 		<Button radius="full" onPress={() => setCount(count + 1)}>
// 			Count is {count}
// 		</Button>
// 	);
// };
import Image from 'next/image';

import React from 'react'

export default function CounterPage() {
    return (
        <>
            <div className='flex justify-center gap-2 '>
                <a href="https://www.freecounterstat.com"
                    title="website counter">
                    <img src="https://counter6.optistats.ovh/private/freecounterstat.php?c=ulkr9lsz4mderfyw3lnp3fkua5nzt4u1"
                        style={{ border: 0 }}
                        title="web page counter"
                        width={150}
                        height={100}
                        alt="web page counter" />
                </a>
            </div >

        </>
    )
}
