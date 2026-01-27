import { rem, Select } from "@mantine/core";
import { useState } from "react";


const select = (tld: string | null, setTld: (value: string | null) => void) => {
    return (
        <Select
            value={tld}
            onChange={setTld}
            data={[
                { value: '.com', label: '.com' },
                { value: '.id', label: '.id' },
                { value: '.co.id', label: '.co.id' },
                { value: '.net', label: '.net' },
                { value: '.org', label: '.org' },
                { value: '', label: 'custom' },
            ]}
            variant="unstyled"
            allowDeselect={false}
            checkIconPosition="right"
            styles={{
                input: {
                    fontWeight: 500,
                    fontSize: rem(12),
                    color: 'var(--mantine-color-dimmed)',
                    textAlign: 'left',
                    paddingRight: rem(10),
                },
            }}
        />
    )
};

export default select;