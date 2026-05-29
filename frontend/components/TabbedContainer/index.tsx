"use client"

import clsx from "clsx"
import { useState } from "react"

interface TabbedContainerProps {
    tabs: string[], 
    onTabChange?: (tabIndex: number) => void //al clickear cualquier tab
}

export default function TabContainer({ tabs, onTabChange }: TabbedContainerProps): React.ReactElement {
    const [selectedTab, setSelectedTab] = useState<number>(0)

    return <div className="w-full flex flex-col gap-4 mb-4">
        {tabs? 
            <div className="flex flex-row w-full">
                {tabs.map((tab, index) => <button key={index} className={clsx("flex-1 p-2 text-black hover:bg-black/10 transition-all duration-100 border-black border-[0.1vw]", 
                    index === 0 && "rounded-s-md", 
                    index === tabs.length-1 && "rounded-e-md", 
                    index === selectedTab && "bg-black/10")} 
                    onClick={() => {
                        if(index === selectedTab) return
                        setSelectedTab(index)
                        onTabChange?.(index)
                    }}>{tab}</button>)}
            </div>  
        :
            <div className="w-full h-10 bg-red-500 rounded-md flex items-center justify-center">
                <p className="text-white">No se han proporcionado tabs</p> 
            </div>  
        }
    </div>
}