import re

path = r"d:\ktltc\src\app\(website)\administrativestructure\page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's find the first catch block
# We want to keep everything up to setCommittee(commStaff);\n        }\n      } catch (error) {\n        console.error("Failed to fetch administrative structure data", error);\n        // Set empty fallbacks on failure\n        setResourceHeads([]);\n        setResourceOfficers([]);\n        setStrategyHeads([]);\n        setStrategyOfficers([]);\n        setStudentHeads([]);\n        setStudentOfficers([]);\n        setAcademicHeads([]);\n        setAcademicOfficers([]);\n        setAcademicDepts([]);\n        setCommittee([]);\n      }

# And then we want to end it with:
#       } finally {\n        setLoading(false);\n      }\n    };\n    fetchData();\n  }, []);

# Let's locate the first "setCommittee(commStaff);"
idx1 = content.find("setCommittee(commStaff);")
if idx1 == -1:
    print("Could not find setCommittee(commStaff);")
    exit(1)

# Now find the first "catch (error)" after that
idx_catch = content.find("catch (error)", idx1)
if idx_catch == -1:
    print("Could not find catch block after setCommittee")
    exit(1)

# Find the end of this catch block, which ends with the matching brace before the next "finally"
# Let's find the "setCommittee([]);\n      }" sequence
idx_end_catch = content.find("setCommittee([]);\n      }", idx_catch)
if idx_end_catch == -1:
    idx_end_catch = content.find("setCommittee([])", idx_catch)
    if idx_end_catch == -1:
        print("Could not find end of catch block")
        exit(1)
    idx_end_catch_brace = content.find("}", idx_end_catch)
else:
    idx_end_catch_brace = idx_end_catch + len("setCommittee([]);\n      }") - 1

# Let's find the closing of the entire try-catch-finally block.
# We know the rest of the code should continue with "if (loading) {" or "  if (loading) {"
idx_loading = content.find("if (loading)", idx_end_catch_brace)
if idx_loading == -1:
    print("Could not find if (loading)")
    exit(1)

# So we want to replace the whole broken range from after the first catch block's closing brace (idx_end_catch_brace + 1)
# up to the start of "if (loading)" with:
# "\n      } finally {\n        setLoading(false);\n      }\n    };\n    fetchData();\n  }, []);\n\n  "

clean_content = content[:idx_end_catch_brace + 1] + "\n      } finally {\n        setLoading(false);\n      }\n    };\n    fetchData();\n  }, []);\n\n  " + content[idx_loading:]

# Also let's fix any garbled text in the Loading message:
clean_content = clean_content.replace("喔佮赋喔ム副喔囙箓喔弗喔斷箓喔勦福喔囙釜喔｀箟喔侧竾喔竾喔勦箤喔佮กร...", "กำลังโหลดโครงสร้างองค์กร...")
clean_content = clean_content.replace("喔澿箞喔侧涪喔氞福喔脆斧喔侧ฟ喔椸福喔编笧喔⑧覆喔佮ฟ", "ฝ่ายบริหารทรัพยากร")
clean_content = clean_content.replace("喔權覆喔囙釜喔侧抚喔犩抚喔脆竵喔 喙傕笧喔樴复喙屶競喔侧ฟ", "นางสาวภวิกา โพธิ์ขาว")
clean_content = clean_content.replace("/images/喔溹腹喙夃笟喔｀复喔覆喔/5.webp", "/images/personal/ภวิกา.webp")

with open(path, "w", encoding="utf-8") as f:
    f.write(clean_content)

print("Successfully cleaned administrative structure page!")
