import { useEffect, useRef, useState } from "react";
import { useSearchMembers } from "../../../../../hooks/useWorkspaceInvite";

export const useDebouncedMemberSearch = (workspaceId) => {
    const [inputValue, setInputValue] = useState("");
    const [debouncedValue, setDebouncedValue] = useState("");
    const [options, setOptions] = useState([]);
    const [open, setOpen] = useState(false);

    const debounceTimeout = useRef(null);

    const handleInputChange = (event, newValue, reason) => {
        const value = newValue ? newValue.trim() : "";
        setInputValue(value);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            setDebouncedValue(value.length >= 3 ? value : "");
        }, 300);
    };

    const { data: memberSearch, isLoading, error } = useSearchMembers(debouncedValue, workspaceId, {
        enabled: !!workspaceId && debouncedValue.length >= 3,
    });

    useEffect(() => {
        if (error) {
            console.error("Error fetching members:", error);
            setOptions([]);
            setOpen(false);
            return;
        }

        console.log("memberSearch for query", debouncedValue, ":", memberSearch);

        if (debouncedValue.length >= 3 && memberSearch) {
            const validMembers = Array.isArray(memberSearch)
                ? memberSearch
                    .filter((member) => {
                        if (!member || !member.id || !(member.full_name || member.user_name || member.email)) {
                            return false;
                        }
                        const query = debouncedValue.toLowerCase();
                        // Prioritize exact email match
                        if (member.email && member.email.toLowerCase() === query) {
                            return true;
                        }
                        // Fallback to partial matches
                        return (
                            (member.full_name && member.full_name.toLowerCase().includes(query)) ||
                            (member.user_name && member.user_name.toLowerCase().includes(query)) ||
                            (member.email && member.email.toLowerCase().includes(query))
                        );
                    })
                    .map((member) => ({
                        id: member.id,
                        full_name: member.full_name || member.user_name || member.email || "Unknown User",
                        email: member.email || "",
                        image: member.image || "",
                        initials: member.initials || member.full_name?.charAt(0) || member.user_name?.charAt(0) || member.email?.charAt(0) || "U",
                        joined: member.joined ?? false,
                        memberType: member.memberType || "normal",
                    }))
                : [];
            setOptions(validMembers);
            setOpen(validMembers.length > 0);
        } else {
            setOptions([]);
            setOpen(false);
        }
    }, [debouncedValue, memberSearch, error]);

    useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, []);

    return {
        inputValue,
        handleInputChange,
        options,
        open,
        isLoading,
        debouncedValue,
    };
};