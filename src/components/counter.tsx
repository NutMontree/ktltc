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
                <div id="sfc35wnnd211yetlwfqs5zy3sbcgxaslccj"></div>
                <script
                    type="text/javascript"
                    src="https://counter6.optistats.ovh/private/counter.js?c=35wnnd211yetlwfqs5zy3sbcgxaslccj&down=async"
                    async
                >
                </script>
                <noscript>
                    <a href="https://www.freecounterstat.com"
                        title="website counter">
                        <Image
                            src="https://counter6.optistats.ovh/private/freecounterstat.php?c=35wnnd211yetlwfqs5zy3sbcgxaslccj"
                            title="website counter"
                            alt="website counter"
                        >
                        </Image>
                    </a>
                </noscript>
            </div >

        </>
    )
}
